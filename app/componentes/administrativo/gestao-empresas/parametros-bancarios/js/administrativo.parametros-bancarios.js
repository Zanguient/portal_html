/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("administrativo-parametros-bancarios", []) 

.controller("administrativo-parametros-bancariosCtrl", ['$scope',
                                             '$state',
                                             '$filter',
                                             '$timeout',
                                             '$http',
                                             /*'$campos',*/
                                             '$webapi',
                                             '$apis',
                                             function($scope,$state,$filter,$timeout,$http,
                                                      /*$campos,*/$webapi,$apis){ 
    
    // Exibição
    $scope.itens_pagina = [10, 20, 50, 100];                                             
    $scope.paginaInformada = 1; // página digitada pelo usuário                                             
    // Dados    
    $scope.parametros = [];
    $scope.adquirentes = [];                                            
    $scope.filtro = {banco : undefined, tipo : '', adquirente : undefined, semadquirentes : false,
                     itens_pagina : $scope.itens_pagina[0], order : 0,
                     pagina : 1, total_registros : 0, faixa_registros : '0-0', total_paginas : 0
                    };  
    $scope.dsTipos = ['CREDIT', 'DEBIT'];                                             
    var divPortletBodyFiltrosPos = 0; // posição da div que vai receber o loading progress
    var divPortletBodyParametrosPos = 1;                                             
    // Modal Parâmetro
    $scope.modalParametro = { titulo : '', banco : undefined, dsTipo : '',
                              adquirente : undefined, dsMemo: '',
                              textoConfirma : '', funcaoConfirma : function(){} };
    var old = null;    
    
    // Permissões                                           
    var permissaoAlteracao = false;
    var permissaoCadastro = false;
    var permissaoRemocao = false;
    // Flags
    $scope.buscandoBancos = false; 
    $scope.exibeTela = false;                                             
                                                 
                                                 
                                                 
    
    // Inicialização do controller
    $scope.administrativo_parametrosBancariosInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Administrativo';                          
        $scope.pagina.subtitulo = 'Parâmetros Bancários';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Obtém as permissões
        if($scope.methodsDoControllerCorrente){
            permissaoAlteracao = $scope.methodsDoControllerCorrente['atualização'] ? true : false;   
            permissaoCadastro = $scope.methodsDoControllerCorrente['cadastro'] ? true : false;
            permissaoRemocao = $scope.methodsDoControllerCorrente['remoção'] ? true : false;
        }
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Carrega adquirentes
            buscaAdquirentes(false, true);
        });
        // Acessou a tela
        $scope.$emit("acessouTela");
    };
                                                 
                                                 
    // PERMISSÕES                                          
    /**
      * Retorna true se o usuário pode cadastrar parâmetros bancários
      */
    $scope.usuarioPodeCadastrarParametros = function(){
        return permissaoCadastro;   
    }
    /**
      * Retorna true se o usuário pode alterar parâmetros bancários
      */
    $scope.usuarioPodeAlterarParametros = function(){
        return permissaoAlteracao;
    }
    /**
      * Retorna true se o usuário pode excluir parâmetros bancários
      */
    $scope.usuarioPodeExcluirParametros = function(){
        return permissaoRemocao;
    }                                              
                                                 
    
    
                                                                                            
                                                 
    // PAGINAÇÃO
    /**
      * Altera efetivamente a página exibida
      */                                            
    var setPagina = function(pagina){
       if(pagina >= 1 && pagina <= $scope.filtro.total_paginas){ 
           $scope.filtro.pagina = pagina;
           buscaParametros();
       }
       $scope.atualizaPaginaDigitada();    
    };
    /**
      * Vai para a página anterior
      */
    $scope.retrocedePagina = function(){
        setPagina($scope.filtro.pagina - 1); 
    };
    /**
      * Vai para a página seguinte
      */                                            
    $scope.avancaPagina = function(){
        setPagina($scope.filtro.pagina + 1); 
    };
    /**
      * Foi informada pelo usuário uma página para ser exibida
      */                                            
    $scope.alteraPagina = function(){
        if($scope.paginaInformada) setPagina(parseInt($scope.paginaInformada));
        else $scope.atualizaPaginaDigitada();  
    };
    /**
      * Sincroniza a página digitada com a que efetivamente está sendo exibida
      */                                            
    $scope.atualizaPaginaDigitada = function(){
        $scope.paginaInformada = $scope.filtro.pagina; 
    };
                                                 
    // EXIBIÇÃO                                             
    /**
      * Notifica que o total de itens por página foi alterado
      */                                            
    $scope.alterouItensPagina = function(){
        buscaParametros();
    }; 
                                                 
    
    
    // TIPO TRANSAÇÃO
    $scope.alterouDsTipo = function(){
        //console.log($scope.filtro.tipo);  
    }
                                                 
    
    // BUSCA BANCOS  
    /**
      * Exibe o código do banco seguido do nome (reduzido ou extenso)
      */
    $scope.exibeBanco = function(banco, reduzido){
        if(typeof banco === 'undefined') return '';
        var text = banco.Codigo + '    ';
        if(reduzido) text += banco.NomeReduzido;   
        else text += banco.NomeExtenso;
        return text.toUpperCase();
    }
    /**
      * Selecionou um banco
      */
    $scope.selecionouBanco = function(){
        //console.log($scope.filtro.banco);    
    }
    /**
      * Se nenhum banco foi selecionado, apaga o conteúdo do input text
      */
    $scope.validaBanco = function(){
        if(!$scope.filtro.banco || $scope.filtro.banco === null ||
           !$scope.filtro.banco.Codigo) 
            $('#buscabanco').val("");    
    }
    $scope.validaBancoModal = function(){
        if(!$scope.modalParametro.banco || !$scope.modalParametro.banco === null ||
           !$scope.modalParametro.banco.Codigo) 
            $('#buscabancomodal').val("");     
    }
    /**
      * Busca o banco digitado
      */
    $scope.buscaBancos = function(texto){
        $scope.buscandoBancos = true;
        
        return $http.get($apis.getUrl($apis.utils.bancos, 
                                [$scope.token, 0, /*$campos.utils.bancos.NomeExtenso*/ 102, 0, 10, 1],
                                {id: /*$campos.utils.bancos.NomeExtenso*/ 102, valor: texto + '%'}))
                 .then(function(dados){
                        $scope.buscandoBancos = false;
                        return dados.data.Registros;
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                     else $scope.showAlert('Houve uma falha ao obter bancos (' + failData.status + ')', true, 'danger', true);

                     $scope.buscandoBancos = false;
                     return [];
              });          
    }
         
    
    
    // ADQUIRENTES
    /**
      * Somente os registros sem adquirente associada
      */
    $scope.selecionouCheckboxAdquirente = function(){
        if($scope.filtro.semadquirentes) $scope.filtro.adquirente = null;    
    }
    $scope.alterouAdquirente = function(){
        // ....
    }
    /**
      * Busca as adquirentes
      */
    var buscaAdquirentes = function(progressoemexecucao, buscaParametrosBancarios){
        var filtros = {id : /*$campos.card.tbadquirente.stAdquirente*/ 103,
                       valor : 1};
        
        if(!progressoemexecucao) $scope.showProgress(divPortletBodyFiltrosPos);
        
        $webapi.get($apis.getUrl($apis.card.tbadquirente, 
                                [$scope.token, 1, /*$campos.card.tbadquirente.dsAdquirente*/ 102, 0],
                                filtros)) 
            .then(function(dados){           
                // Obtém os dados
                $scope.adquirentes = dados.Registros;
                // Fecha o progress
                $scope.hideProgress(divPortletBodyFiltrosPos);
                if(buscaParametrosBancarios) buscaParametros();
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter adquirentes (' + failData.status + ')', true, 'danger', true);
                 // Fecha o progress
                 $scope.hideProgress(divPortletBodyFiltrosPos);  
        });
    }
    
    
    
    
                                                 
    // BUSCA PARÂMETROS BANCÁRIOS
    /**
      * Faz a busca baseado nos filtros selecionados
      */
    $scope.buscaParametrosBancarios = function(){
        buscaParametros();    
    }
    
    /**
      * Reseta os filtros selecionados
      */
    $scope.resetaFiltros = function(){
        $scope.filtro.adquirente = $scope.filtro.banco = $scope.filtro.tipo = null;
        $scope.parametros = [];
        $scope.validaBanco();
    }
    
    
    /**
      * Obtém os filtros de busca
      */
    var obtemFiltrosBusca = function(){
        var filtros = [];
        
        // BANCO
        if($scope.filtro.banco && $scope.filtro.banco !== null && $scope.filtro.banco.Codigo){
            filtros.push({id: /*$campos.card.tbbancoparametro.cdBanco*/ 100,
                          valor: $scope.filtro.banco.Codigo});    
        }
        
        // TIPO
        if($scope.filtro.tipo && $scope.filtro.tipo !== null){
            filtros.push({id: /*$campos.card.tbbancoparametro.dsTipo*/ 103,
                          valor: $scope.filtro.tipo});
        }
        
        // ADQUIRENTE
        if($scope.filtro.semadquirentes){
            filtros.push({id: /*$campos.card.tbbancoparametro.cdAdquirente*/ 102,
                          valor: -1});       
        }else if($scope.filtro.adquirente && $scope.filtro.adquirente !== null){
            filtros.push({id: /*$campos.card.tbbancoparametro.cdAdquirente*/ 102,
                          valor: $scope.filtro.adquirente.cdAdquirente}); 
        }
        return filtros.length > 0 ? filtros : undefined;
    }
                                           
    /**
      * Busca parâmetros bancários
      */
    var buscaParametros = function(progressosemexecucao){

        if(!progressosemexecucao){
            $scope.showProgress(divPortletBodyFiltrosPos);
            $scope.showProgress(divPortletBodyParametrosPos);
        }
        
        // Filtro  
        var filtros = obtemFiltrosBusca();
        
        //$scope.hideProgress(divPortletBodyFiltrosPos);
        //$scope.hideProgress(divPortletBodyParametrosPos);
           
        $webapi.get($apis.getUrl($apis.card.tbbancoparametro, 
                                [$scope.token, 2, 
                                 /*$campos.card.tbbancoparametro.cdBanco*/ 100, 0, 
                                 $scope.filtro.itens_pagina, $scope.filtro.pagina],
                                filtros)) 
            .then(function(dados){           

                // Obtém os dados
                $scope.parametros = dados.Registros;
                
                // Set valores de exibição
                $scope.filtro.total_registros = dados.TotalDeRegistros;
                $scope.filtro.total_paginas = Math.ceil($scope.filtro.total_registros / $scope.filtro.itens_pagina);
                if($scope.parametros.length === 0) $scope.filtro.faixa_registros = '0-0';
                else{
                    var registroInicial = ($scope.filtro.pagina - 1)*$scope.filtro.itens_pagina + 1;
                    var registroFinal = registroInicial - 1 + $scope.filtro.itens_pagina;
                    if(registroFinal > $scope.filtro.total_registros) registroFinal = $scope.filtro.total_registros;
                    $scope.filtro.faixa_registros =  registroInicial + '-' + registroFinal;
                }

                // Verifica se a página atual é maior que o total de páginas
                if($scope.filtro.pagina > $scope.filtro.total_paginas)
                    setPagina(1); // volta para a primeira página e refaz a busca
           
                // Fecha o progress
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyParametrosPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter parâmetros bancários (' + failData.status + ')', true, 'danger', true);
                 // Fecha o progress
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyParametrosPos);
              });  
    };
        
                                                 
                                                
                      
                                                 
                   
    /**
      * Retorna true se estiver cadastrando
      */
    $scope.ehCadastro = function(){
        return old === null;
    }                                             
     
    // AÇÕES
    var exibeModalParametroBancario = function(){
        $('#modalParametroBancario').modal('show');       
    }
    var fechaModalParametroBancario = function(){
        $('#modalParametroBancario').modal('hide');       
    }
                                                 
                                                 
    /**
      * Exibe o input para cadastro de novo parâmetro bancario
      */
    $scope.novoParametroBancario = function(){
        $scope.modalParametro.titulo = 'Nova Parâmetro Bancário';
        $scope.modalParametro.textoConfirma = 'Cadastrar';
        $scope.modalParametro.funcaoConfirma = salvarParametroBancario;
        $scope.modalParametro.banco = undefined;
        $scope.modalParametro.adquirente = null;//$scope.adquirentes[0];
        $scope.modalParametro.dsMemo = '';
        $scope.modalParametro.dsTipo = $scope.dsTipos[0];
        
        old = null;
        
        // Exibe o modal
        exibeModalParametroBancario();
    };
         
            
    /**
      * Valida as informações preenchidas no modal
      */                                             
    var camposModalValidos = function(){
        // Valida
        if(!$scope.modalParametro.banco || $scope.modalParametro.banco === null || !$scope.modalParametro.banco.Codigo){
            $scope.showModalAlerta('Selecione o banco!');
            return false;
        }
        /*if(!$scope.modalParametro.adquirente || $scope.modalParametro.adquirente === null){
            $scope.showModalAlerta('Informe a adquirente!');
            return false;
        }*/
        if(!$scope.modalParametro.dsTipo){
            $scope.showModalAlerta('Selecione o tipo de transação!');
            return false;
        }
        if(!$scope.modalParametro.dsMemo){
            $scope.showModalAlerta('Informe a descrição!');
            return false;
        }
        return true;
    }
                                                 
                                                 
    /**
      * Valida as informações preenchidas e envia para o servidor
      */
    var salvarParametroBancario = function(){

        // Valida campos
        if(!camposModalValidos()) return;
        
        // Obtém o JSON
        var cdAdquirente = $scope.modalParametro.adquirente && $scope.modalParametro.adquirente !== null ? 
                              $scope.modalParametro.adquirente.cdAdquirente : -1;  
        var jsonParametro = { cdBanco : $scope.modalParametro.banco.Codigo, 
                              dsMemo : $scope.modalParametro.dsMemo,
                              dsTipo : $scope.modalParametro.dsTipo,
                              cdAdquirente : cdAdquirente
                            };
        //console.log(jsonParametro);
        
        // POST
        $scope.showProgress();
        $webapi.post($apis.getUrl($apis.card.tbbancoparametro, undefined,
                                 {id : 'token', valor : $scope.token}), jsonParametro) 
            .then(function(dados){           
                $scope.showAlert('Parâmetro bancário cadastrado com sucesso!', true, 'success', true);
                // Fecha os progress
                $scope.hideProgress();
                // Fecha o modal
                fechaModalParametroBancario();
                // Relista
                buscaParametros();
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 500) $scope.showAlert('Parâmetro bancário já cadastrado!', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao cadastrar parâmetro bancário (' + failData.status + ')', true, 'danger', true);
                 // Fecha os progress
                 $scope.hideProgress();
              });   
    }
                                                 
    
    /**
      * Altera os dados do parâmetro bancário
      */
    $scope.editarParametroBancario = function(parametro){
        
        old = parametro;
        
        $scope.modalParametro.titulo = 'Altera Parâmetro Bancário';
        $scope.modalParametro.textoConfirma = 'Alterar';
        $scope.modalParametro.funcaoConfirma = alterarParametroBancario;
        $scope.modalParametro.banco = parametro.banco;
        $scope.modalParametro.dsMemo = parametro.dsMemo;
        $scope.modalParametro.dsTipo = parametro.dsTipo.toUpperCase();
        if(parametro.adquirente === null) $scope.modalParametro.adquirente = undefined;
        else $scope.modalParametro.adquirente = $filter('filter')($scope.adquirentes, function(a) {return a.cdAdquirente === parametro.adquirente.cdAdquirente;})[0];
        
        // Exibe o modal
        exibeModalParametroBancario();      
    };
    /**
      * Valida as informações alteradas e envia para o servidor
      */                                             
    var alterarParametroBancario = function(){

        // Valida campos
        if(typeof old === 'undefined' || old === null) return;
        
        // Houve alterações?
        if($scope.modalParametro.banco.Codigo === old.banco.Codigo &&
           $scope.modalParametro.dsMemo.toUpperCase() === old.dsMemo.toUpperCase() &&
           $scope.modalParametro.dsTipo.toUpperCase() === old.dsTipo.toUpperCase() &&
           // Alterou adquirente ?
           (((!$scope.modalParametro.adquirente || $scope.modalParametro.adquirente === null) && old.adquirente === null) || 
            ($scope.modalParametro.adquirente && $scope.modalParametro.adquirente !== null && old.adquirente !== null && 
             $scope.modalParametro.adquirente.cdAdquirente === old.adquirente.cdAdquirente))){
            // Não houve alterações
            fechaModalParametroBancario();
            return;
        }
        
        if(!camposModalValidos()) return;
        
        // Obtém o JSON
        var cdAdquirente = $scope.modalParametro.adquirente && $scope.modalParametro.adquirente !== null ? 
                              $scope.modalParametro.adquirente.cdAdquirente : -1;  
        var jsonParametro = { cdBanco : $scope.modalParametro.banco.Codigo, 
                              dsMemo : $scope.modalParametro.dsMemo,
                              dsTipo : $scope.modalParametro.dsTipo,
                              cdAdquirente : cdAdquirente
                            };
        //console.log(jsonParametro);
        
        // UPDATE
        $scope.showProgress();
        $webapi.update($apis.getUrl($apis.card.tbbancoparametro, undefined,
                                 {id : 'token', valor : $scope.token}), jsonParametro) 
            .then(function(dados){           
                $scope.showAlert('Parâmetro bancário alterado com sucesso!', true, 'success', true);
                // Fecha os progress
                $scope.hideProgress();
                // Fecha o modal
                fechaModalParametroBancario();
                // Relista
                buscaParametros();
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao alterar parâmetro bancário (' + failData.status + ')', true, 'danger', true);
                 // Fecha os progress
                 $scope.hideProgress();
              });   
    }
    
   /**
     * Solicita confirmação para excluir o parâmetro bancário
     */
    $scope.excluirParametroBancario = function(parametro){
        $scope.showModalConfirmacao('Confirmação', 
                                    'Tem certeza que deseja excluir o parâmetro bancário?',
                                     excluiParametroBancario, 
                                    {cdBanco : parametro.banco.Codigo,
                                     dsMemo: parametro.dsMemo}, 'Sim', 'Não');  
    };                   
    /**
      * Efetiva a exclusão do parâmetro bancário
      */
    var excluiParametroBancario = function(json){
         // Exclui
         $scope.showProgress(divPortletBodyFiltrosPos);
         $scope.showProgress(divPortletBodyParametrosPos);
         $webapi.delete($apis.getUrl($apis.card.tbbancoparametro, undefined,
                                     [{id: 'token', valor: $scope.token},
                                      {id: 'cdBanco', valor: json.cdBanco},
                                      {id: 'dsMemo', valor: json.dsMemo}]))
                .then(function(dados){           
                    $scope.showAlert('Parâmetro bancário excluído com sucesso!', true, 'success', true);
                    // Relista
                    buscaParametros(true);
                  },
                  function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                     else if(failData.status === 500) $scope.showAlert('Parâmetro bancário não pode ser excluído!', true, 'warning', true); 
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                     else $scope.showAlert('Houve uma falha ao excluir o parâmetro bancário (' + failData.status + ')', true, 'danger', true);
                     // Fecha os progress
                     $scope.hideProgress(divPortletBodyFiltrosPos);
                     $scope.hideProgress(divPortletBodyParametrosPos);
                  });         
    }
    
}]);