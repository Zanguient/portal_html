/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("administrativo-contas-correntes", []) 

.filter('orderAdquirentesEmpresas', function() {
  return function(items, field, reverse) {
    var filtered = [];
    angular.forEach(items, function(item) {
      filtered.push(item);
    });
    filtered.sort(function (a, b) {
        if(a.empresa.ds_fantasia > b.empresa.ds_fantasia) return 1;
        if(a.empresa.ds_fantasia < b.empresa.ds_fantasia) return -1;
        // Mesmo nome fantasia => ordena pela descrição da adquirente
        return a.adquirente.dsAdquirente > b.adquirente.dsAdquirente ? 1 : -1;
    });
    if(reverse) filtered.reverse();
    return filtered;
  };
})

.filter('orderVigentes', function() {
  return function(items, field, reverse) {
    var filtered = [];
    angular.forEach(items, function(item) {
      filtered.push(item);
    });
    filtered.sort(function (a, b) {
        if(a.loginAdquirenteEmpresa.empresa.ds_fantasia > b.loginAdquirenteEmpresa.empresa.ds_fantasia) return 1;
        if(a.loginAdquirenteEmpresa.empresa.ds_fantasia < b.loginAdquirenteEmpresa.empresa.ds_fantasia) return -1;
        // Mesmo nome fantasia => ordena pela descrição da adquirente
        return a.loginAdquirenteEmpresa.adquirente.dsAdquirente > b.loginAdquirenteEmpresa.adquirente.dsAdquirente ? 1 : -1;
    });
    if(reverse) filtered.reverse();
    return filtered;
  };
})

.controller("administrativo-contas-correntesCtrl", ['$scope',
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
    $scope.contas = [];     
    $scope.filiais = [];
    $scope.filtro = {itens_pagina : $scope.itens_pagina[0], order : 0,
                     pagina : 1, total_registros : 0, faixa_registros : '0-0', total_paginas : 0
                    };
    var divPortletBodyContasPos = 0; // posição da div que vai receber o loading progress
    // Modal Conta
    $scope.modalConta = { titulo : '', banco : undefined, //buscaBanco : '',
                          nrAgencia : '', nrConta : '', nrCnpj : '', filial: '',
                          textoConfirma : '', funcaoConfirma : function(){} };
    var old = null;    
    // Modal Adquirente Empresa 
    var adquirentesempresas = []; // todas as adquirentes-filial relacionadas ao grupo
    $scope.modalAdquirenteEmpresa = { conta : '', 
                                      adquirentesempresa : [], // originalmente as adquirente-filiais não associadas à conta
                                      vigenciaSelecionada : undefined,
                                      adquirenteEmpresaSelecionada : undefined,
                                      vigentes : [],
                                      naoSelecionadas: [] 
                                    };
    // Permissões                                           
    var permissaoAlteracao = false;
    var permissaoCadastro = false;
    var permissaoRemocao = false;
    // Flags
    var cnpjValido = false;
    $scope.validandoCNPJ = false;
    $scope.buscandoBancos = false;                                             
                                                 
                                                 
                                                 
    
    // Inicialização do controller
    $scope.administrativo_contasCorrentesInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Administrativo';                          
        $scope.pagina.subtitulo = 'Contas Corrente';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando houver alteração do grupo empresa na barra administrativa                                           
        $scope.$on('alterouGrupoEmpresa', function(event){ 
            // Avalia grupo empresa
            if($scope.usuariologado.grupoempresa){
                buscaContas();
                buscaFiliais();
                buscaLoginAdquirenteEmpresa();
            }else{ // reseta tudo e não faz buscas 
                $scope.contas = []; 
                $scope.filiais = [];
                $scope.modalAdquirenteEmpresa.adquirentesempresa = [];
            }
        });
        // Obtém as permissões
        if($scope.methodsDoControllerCorrente){
            permissaoAlteracao = $scope.methodsDoControllerCorrente['atualização'] ? true : false;   
            permissaoCadastro = $scope.methodsDoControllerCorrente['cadastro'] ? true : false;
            permissaoRemocao = $scope.methodsDoControllerCorrente['remoção'] ? true : false;
        }
        // Carrega dados associados
        if($scope.usuariologado.grupoempresa){
            buscaContas();
            buscaFiliais();
            buscaLoginAdquirenteEmpresa();
        }
    };
                                                 
                                                 
    // PERMISSÕES                                          
    /**
      * Retorna true se o usuário pode cadastrar contas correntes
      */
    $scope.usuarioPodeCadastrarContas = function(){
        return $scope.usuariologado.grupoempresa && permissaoCadastro;   
    }
    /**
      * Retorna true se o usuário pode alterar contas correntes
      */
    $scope.usuarioPodeAlterarContas = function(){
        return $scope.usuariologado.grupoempresa && permissaoAlteracao;
    }
    /**
      * Retorna true se o usuário pode excluir contas correntes
      */
    $scope.usuarioPodeExcluirContas = function(){
        return $scope.usuariologado.grupoempresa && permissaoRemocao;
    }                                              
                                                 
    
    
                                                                                            
                                                 
    // PAGINAÇÃO
    /**
      * Altera efetivamente a página exibida
      */                                            
    var setPagina = function(pagina){
       if(pagina >= 1 && pagina <= $scope.filtro.total_paginas){ 
           $scope.filtro.pagina = pagina;
           buscaContas();
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
        else $scope.setaPaginaDigitada();  
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
        buscaContas();
    }; 
                                                 
            
    
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
        //console.log($scope.modalConta.banco);    
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
                                                 
                                                 
    // BUSCA CONTAS CORRENTES                                                                                     
                                           
    /**
      * Busca Conta Correntes
      */
    var buscaContas = function(){
        
        // Avalia se há um grupo empresa selecionado
        if(!$scope.usuariologado.grupoempresa){
            $scope.showModalAlerta('Por favor, selecione uma empresa', 'Atos Capital', 'OK', 
                                   function(){
                                         $timeout(function(){$scope.setVisibilidadeBoxGrupoEmpresa(true);}, 300);
                                    }
                                  );
            return;   
        }
        
        $scope.showProgress(divPortletBodyContasPos);
        
        // Filtro  
        var filtros = {id: /*$campos.card.tbcontacorrente.cdGrupo*/ 101,
                      valor: $scope.usuariologado.grupoempresa.id_grupo};
           
        $webapi.get($apis.getUrl($apis.card.tbcontacorrente, 
                                [$scope.token, 2, 
                                 /*$campos.card.tbcontacorrente.cdBanco*/ 103, 0, 
                                 $scope.filtro.itens_pagina, $scope.filtro.pagina],
                                filtros)) 
            .then(function(dados){           

                // Obtém os dados
                $scope.contas = dados.Registros;
                
                // Set valores de exibição
                $scope.filtro.total_registros = dados.TotalDeRegistros;
                $scope.filtro.total_paginas = Math.ceil($scope.filtro.total_registros / $scope.filtro.itens_pagina);
                if($scope.contas.length === 0) $scope.filtro.faixa_registros = '0-0';
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
                $scope.hideProgress(divPortletBodyContasPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter contas correntes (' + failData.status + ')', true, 'danger', true);
                 // Fecha o progress
                 $scope.hideProgress(divPortletBodyContasPos);
              });       
    };
        
                                                 
                                                 
    /**
      * Busca as filiais
      */
    var buscaFiliais = function(){

       var filtros = undefined;

       // Filtro do grupo empresa => barra administrativa
       if($scope.usuariologado.grupoempresa){ 
           filtros = [{id: /*$campos.cliente.empresa.cdGrupo*/ 116, 
                       valor: $scope.usuariologado.grupoempresa.id_grupo}];
           if($scope.usuariologado.empresa) filtros.push({id: /*$campos.cliente.empresa.nu_cnpj*/ 100, 
                                                          valor: $scope.usuariologado.empresa.nu_cnpj});
       }
       
       $webapi.get($apis.getUrl($apis.cliente.empresa, 
                                [$scope.token, 0, /*$campos.cliente.empresa.ds_fantasia*/ 104],
                                filtros)) 
            .then(function(dados){
                $scope.filiais = dados.Registros;
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter filiais (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
              });     
    };                                             
    
    
                                                 
    // Valida CNPJ
    /*$scope.cnpjValido = function(){
        return cnpjValido;    
    }                                              
    $scope.validaCNPJ = function(force){
        if($scope.modalConta.nrCnpj && $scope.modalConta.nrCnpj.length == 14){
            if(!force && old !== null && old.empresa.nu_cnpj === $scope.modalConta.nrCnpj){ 
                // Não alterou o cnpj
                $('#labelCNPJInvalido').hide();
                cnpjValido = true;
                $('#icon-cnpj').hide(); // sem exibir o ícone
                return;
            }
            
            $scope.validandoCNPJ = true;
            
            var filtro = [{id:/*$campos.cliente.empresa.nu_cnpj* / 100, valor:$scope.modalConta.nrCnpj}];
            // O CNPJ é validado em relação às filiais do grupo associado
            if($scope.usuariologado.grupoempresa) 
                filtro.push({id:/*$campos.cliente.empresa.id_grupo* / 116, 
                             valor:$scope.usuariologado.grupoempresa.id_grupo});
            

            $webapi.get($apis.getUrl($apis.cliente.empresa, [$scope.token, 0], filtro))
            // Verifica se a requisição foi respondida com sucesso
                .then(function(dados){
                            if(!dados) console.log("DADOS NÃO FORAM RECEBIDOS!");
                            else if(dados.Registros && dados.Registros.length == 0){ 
                                $('#labelCNPJInvalido').show();
                                cnpjValido = false;
                                $('#icon-cnpj').show();
                            }else{
                                $scope.modalConta.filial = dados.Registros[0].ds_fantasia;
                                $('#labelCNPJInvalido').hide();
                                cnpjValido = true;
                                $('#icon-cnpj').show();
                            }
                            $scope.validandoCNPJ = false;
                        },
                        function(failData){
                            console.log("FALHA AO VALIDAR CNPJ");
                            $scope.validandoCNPJ = false;
                        });
        }else
            cnpjValido = false;  
        
    };   */                                            
                                                 
                   
                                                 
    $scope.ehCadastro = function(){
        return old === null;
    }                                             
     
    // AÇÕES
    var exibeModalConta = function(){
        $('#modalConta').modal('show');       
    }
    var fechaModalConta = function(){
        $('#modalConta').modal('hide');       
    }
                                                 
                                                 
    /**
      * Exibe o input para cadastro de nova conta
      */
    $scope.novaConta = function(){
        $scope.modalConta.titulo = 'Nova Conta em ' + $scope.usuariologado.grupoempresa.ds_nome.toUpperCase();
        $scope.modalConta.textoConfirma = 'Cadastrar';
        $scope.modalConta.funcaoConfirma = salvarConta;
        //$scope.modalConta.buscaBanco = '';
        $scope.modalConta.banco = undefined;
        $scope.modalConta.nrAgencia = '';
        $scope.modalConta.nrConta = '';
        //$scope.modalConta.nrCnpj = '';
        $scope.modalConta.filial = $scope.filiais[0];
        
        old = null;
        // Esconde os texto e ícone de erro de cnpj
        /*$('#labelCNPJInvalido').hide();
        $('#icon-cnpj').hide(); 
        // Ajusta o valor do flag
        cnpjValido = false;*/
        
        // Exibe o modal
        exibeModalConta();
    };
         
            
    /**
      * Valida as informações preenchidas no modal
      */                                             
    var camposModalValidos = function(){
        // Valida
        if(!$scope.modalConta.banco){
            $scope.showModalAlerta('Informe o banco!');
            return false;
        }
        if(!$scope.modalConta.nrAgencia){
            $scope.showModalAlerta('Informe a agência!');
            return false;
        }
        if(!$scope.modalConta.nrConta){
            $scope.showModalAlerta('Informe a conta!');
            return false;
        }
        /*if(!$scope.cnpjValido()){
            $scope.showModalAlerta('Informe um CNPJ associado a empresa ' +
                                   $scope.usuariologado.grupoempresa.ds_nome.toUpperCase() + 
                                   ' que esteja armazenado na base!');
            return false;
        }   */
        if(!$scope.modalConta.filial){
            $scope.showModalAlerta('É necessário selecionar uma filial!');
            return false;
        }
        return true;
    }
                                                 
                                                 
    /**
      * Valida as informações preenchidas e envia para o servidor
      */
    var salvarConta = function(){
         // Não faz nada se tiver validando o CNPJ
        if($scope.validandoCNPJ) return;
        
        // Valida campos
        if(!camposModalValidos()) return;
        
        // Obtém o JSON
        var jsonConta = { cdGrupo : $scope.usuariologado.grupoempresa.id_grupo,
                          nrCnpj : $scope.modalConta.filial.nu_cnpj,//nrCnpj,
                          cdBanco : $scope.modalConta.banco.Codigo, 
                          nrAgencia : $scope.modalConta.nrAgencia,
                          nrConta : $scope.modalConta.nrConta
                        };
        //console.log(jsonConta);
        
        // POST
        $scope.showProgress();
        $webapi.post($apis.getUrl($apis.card.tbcontacorrente, undefined,
                                 {id : 'token', valor : $scope.token}), jsonConta) 
            .then(function(dados){           
                $scope.showAlert('Conta cadastrada com sucesso!', true, 'success', true);
                // Fecha os progress
                $scope.hideProgress();
                // Fecha o modal
                fechaModalConta();
                // Relista
                buscaContas();
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 500) $scope.showAlert('Conta já cadastrada!', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao cadastrar conta (' + failData.status + ')', true, 'danger', true);
                 // Fecha os progress
                 $scope.hideProgress();
              });   
    }
                                                 
    
    /**
      * Altera os dados da conta
      */
    $scope.editarConta = function(conta){
        
        old = conta;
        
        $scope.modalConta.titulo = 'Altera conta em ' + $scope.usuariologado.grupoempresa.ds_nome.toUpperCase();
        $scope.modalConta.textoConfirma = 'Alterar';
        $scope.modalConta.funcaoConfirma = alterarConta;
        //$scope.modalConta.buscaBanco = '';
        $scope.modalConta.banco = conta.banco;
        $scope.modalConta.nrAgencia = conta.nrAgencia;
        $scope.modalConta.nrConta = conta.nrConta;
        //$scope.modalConta.nrCnpj = conta.empresa.nrCnpj;
        $scope.modalConta.filial = $filter('filter')($scope.filiais, function(f) {return f.nu_cnpj === conta.empresa.nu_cnpj;})[0];
        
        /* Esconde os texto e ícone de erro de cnpj
        $('#labelCNPJInvalido').hide();
        $('#icon-cnpj').hide(); 
        cnpjValido = true;
        
        $scope.validaCNPJ(true); // força a busca pelo CNPJ para obter o nome da filial*/
        
        // Exibe o modal
        exibeModalConta();      
    };
    /**
      * Valida as informações alteradas e envia para o servidor
      */                                             
    var alterarConta = function(){
        // Não faz nada se tiver validando o CNPJ
        if($scope.validandoCNPJ) return;
        
        // Valida campos
        if(typeof old === 'undefined' || old === null) return;
        
        // Houve alterações?
        if($scope.modalConta.nrConta === old.nrConta &&
           $scope.modalConta.nrAgencia === old.nrAgencia &&
           $scope.modalConta.nrConta === old.nrConta &&
           $scope.modalConta.banco.Codigo === old.banco.Codigo &&
           $scope.modalConta.filial && old.empresa && 
           $scope.modalConta.filial.nu_cnpj === old.empresa.nu_cnpj){//nrCnpj === old.empresa.nu_cnpj){
            // Não houve alterações
            fechaModalConta();
            return;
        }
        
        if(!camposModalValidos()) return;
        
        // Obtém o JSON
        var jsonConta = { idContaCorrente : old.idContaCorrente,
                          nrCnpj : $scope.modalConta.filial.nu_cnpj,//nrCnpj,
                          cdBanco : $scope.modalConta.banco.Codigo, 
                          nrAgencia : $scope.modalConta.nrAgencia,
                          nrConta : $scope.modalConta.nrConta
                        };
        //console.log(jsonConta);
        
        // UPDATE
        $scope.showProgress();
        $webapi.update($apis.getUrl($apis.card.tbcontacorrente, undefined,
                                 {id : 'token', valor : $scope.token}), jsonConta) 
            .then(function(dados){           
                $scope.showAlert('Conta alterada com sucesso!', true, 'success', true);
                // Fecha os progress
                $scope.hideProgress();
                // Fecha o modal
                fechaModalConta();
                // Relista
                buscaContas();
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao alterar conta (' + failData.status + ')', true, 'danger', true);
                 // Fecha os progress
                 $scope.hideProgress();
              });   
    }
    
   /**
     * Solicita confirmação para excluir a filial
     */
    $scope.excluirConta = function(conta){
        $scope.showModalConfirmacao('Confirmação', 
                                    'Tem certeza que deseja excluir a conta?',
                                     excluiConta, conta.idContaCorrente, 'Sim', 'Não');  
    };                   
    /**
      * Efetiva a exclusão da conta
      */
    var excluiConta = function(idContaCorrente){
         // Exclui
         $webapi.delete($apis.getUrl($apis.card.tbcontacorrente, undefined,
                                     [{id: 'token', valor: $scope.token},
                                      {id: 'idContaCorrente', valor: idContaCorrente}]))
                .then(function(dados){           
                    $scope.showAlert('Conta excluída com sucesso!', true, 'success', true);
                    // Fecha os progress
                    $scope.hideProgress();
                    // Fecha o modal
                    fechaModalConta();
                    // Relista
                    buscaContas();
                  },
                  function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                     else if(failData.status === 500) $scope.showAlert('Conta não pode ser excluída!', true, 'warning', true); 
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                     else $scope.showAlert('Houve uma falha ao excluir a conta (' + failData.status + ')', true, 'danger', true);
                     // Fecha os progress
                     $scope.hideProgress();
                  });         
    }
    
    
    
    // ASSOCIAÇÃO DA CONTA ÀS ADQUIRENTES-FILIAIS
    
    var exibeModalAdquirenteEmpresa = function(){
        $('#modalAdquirenteEmpresa').modal('show');       
    }
    var fechaModalAdquirenteEmpresa = function(){
        $('#modalAdquirenteEmpresa').modal('hide');       
    }
    
    /**
      * Retoma as associações previamente salvas
      */
    $scope.resetaAdquirentesEmpresas = function(novaContaSelecionada){
        // Vigentes
        $scope.modalAdquirenteEmpresa.vigentes = [];
        angular.copy($scope.modalAdquirenteEmpresa.conta.vigentes, $scope.modalAdquirenteEmpresa.vigentes); 

        // Não associadas => adiciona as adquirentesempresas que não estão na lista de geral
        if(novaContaSelecionada || $scope.modalAdquirenteEmpresa.adquirentesempresa.length === 0){
            $scope.modalAdquirenteEmpresa.adquirentesempresa = [];
            for(var k = 0; k < adquirentesempresas.length; k++){
                var adquirenteempresa = adquirentesempresas[k];
                if ($filter('filter')($scope.modalAdquirenteEmpresa.vigentes, function(v){return v.loginAdquirenteEmpresa.cdLoginAdquirenteEmpresa === adquirenteempresa.cdLoginAdquirenteEmpresa}).length === 0)
                    $scope.modalAdquirenteEmpresa.adquirentesempresa.push(adquirenteempresa);   
            }
        }
        // Lista de exibição
        $scope.modalAdquirenteEmpresa.naoSelecionadas = [];
        angular.copy($scope.modalAdquirenteEmpresa.adquirentesempresa, $scope.modalAdquirenteEmpresa.naoSelecionadas); 
        
        // Seleciona o primeiro elemento das relações
        $scope.modalAdquirenteEmpresa.vigenciaSelecionada = $scope.modalAdquirenteEmpresa.vigentes[0];
        $scope.modalAdquirenteEmpresa.adquirenteEmpresaSelecionada = $scope.modalAdquirenteEmpresa.naoSelecionadas[0];   
    }
    
    /**
      * Exibe um modal com as filiais vinculadas a conta e possibilita vincular outras
      */
    $scope.filiaisVinculadas = function(conta){
        $scope.modalAdquirenteEmpresa.conta = conta;  
        
        // Reset
        $scope.resetaAdquirentesEmpresas(true);
        
        // Exibe modal
        exibeModalAdquirenteEmpresa();
    };
                                                 
    
    var buscaLoginAdquirenteEmpresa = function(){
        $webapi.get($apis.getUrl($apis.card.tbloginadquirenteempresa, 
                                [$scope.token, 2, 
                                 /*$campos.card.tbloginadquirenteempresa.empresa + $campos.cliente.empresa.ds_fantasia - 100 */
                                 304, 0],
                                 [{id: /*$campos.card.tbloginadquirenteempresa.cdGrupo*/ 102, 
                                  valor: $scope.usuariologado.grupoempresa.id_grupo},
                                  {id: /*$campos.card.tbloginadquirenteempresa.stLoginAdquirente*/ 108, 
                                  valor: 1}])) // somente as com status okay
            .then(function(dados){           
                adquirentesempresas = dados.Registros;
                //console.log($scope.modalAdquirenteEmpresa.adquirentesempresa);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter registros adquirente-filial associados a empresa (' + failData.status + ')', true, 'danger', true);
              });           
    }
    

    /**
      * Retorna o nome da filial seguido da adquirente
      */    
    $scope.getAdquirenteEmpresaAmigavel = function(adquirenteempresa){
        if(!adquirenteempresa) return '';
        var txt = adquirenteempresa.empresa.ds_fantasia + 
                  String.fromCharCode(160) + String.fromCharCode(160) + String.fromCharCode(160) +
                  String.fromCharCode(160) + String.fromCharCode(160) + String.fromCharCode(160) +
                  adquirenteempresa.adquirente.dsAdquirente;
        return txt.toUpperCase();
    }
    
    /**
      * Associa adquirente-empresa não selecionada
      */
    $scope.associaAdquirenteEmpresa = function(){
        if(!$scope.modalAdquirenteEmpresa.adquirenteEmpresaSelecionada) return;    
        // Remove da lista de não associados
        var index = $scope.modalAdquirenteEmpresa.naoSelecionadas.indexOf($scope.modalAdquirenteEmpresa.adquirenteEmpresaSelecionada);
        $scope.modalAdquirenteEmpresa.naoSelecionadas.splice(index,1);
        
        // Adiciona na lista de associados
        $scope.modalAdquirenteEmpresa.vigentes.push({loginAdquirenteEmpresa: $scope.modalAdquirenteEmpresa.adquirenteEmpresaSelecionada});
        // Ordena
        $scope.modalAdquirenteEmpresa.vigentes = $filter('orderVigentes')($scope.modalAdquirenteEmpresa.vigentes, '');
        
        // Seleciona o primeiro elemento das relações
        $scope.modalAdquirenteEmpresa.vigenciaSelecionada = $scope.modalAdquirenteEmpresa.vigentes[0];
        $scope.modalAdquirenteEmpresa.adquirenteEmpresaSelecionada = $scope.modalAdquirenteEmpresa.naoSelecionadas[0];
    }
    
    /**
      * Desassocia adquirente-empresa selecionada
      */
    $scope.desassociaAdquirenteEmpresa = function(){
        if(!$scope.modalAdquirenteEmpresa.vigenciaSelecionada) return;    
        // Remove da lista de associados
        var index = $scope.modalAdquirenteEmpresa.vigentes.indexOf($scope.modalAdquirenteEmpresa.vigenciaSelecionada);
        $scope.modalAdquirenteEmpresa.vigentes.splice(index,1);

        // Adiciona na lista de não associados
        $scope.modalAdquirenteEmpresa.naoSelecionadas.push($scope.modalAdquirenteEmpresa.vigenciaSelecionada.loginAdquirenteEmpresa);
        // Ordena
        $scope.modalAdquirenteEmpresa.naoSelecionadas = $filter('orderAdquirentesEmpresas')($scope.modalAdquirenteEmpresa.naoSelecionadas, '');
        
        // Seleciona o primeiro elemento das relações
        $scope.modalAdquirenteEmpresa.vigenciaSelecionada = $scope.modalAdquirenteEmpresa.vigentes[0];
        $scope.modalAdquirenteEmpresa.adquirenteEmpresaSelecionada = $scope.modalAdquirenteEmpresa.naoSelecionadas[0];
    }
    
    /**
      * Avalia as adquirentes-empresas associadas e desassociadas e envia o json
      */
    $scope.salvaAdquirentesEmpresas = function(){
        // Procura as novas associações e desassociações
        var idContaCorrente = $scope.modalAdquirenteEmpresa.conta.idContaCorrente;
        var associar = [];
        var desassociar = [];
        
        
        // Novas associações ?
        for(var k = 0; k < $scope.modalAdquirenteEmpresa.vigentes.length; k++){ 
            var vigente = $scope.modalAdquirenteEmpresa.vigentes[k];
            if($filter('filter')($scope.modalAdquirenteEmpresa.conta.vigentes, function(v){ return v.loginAdquirenteEmpresa.cdLoginAdquirenteEmpresa === vigente.loginAdquirenteEmpresa.cdLoginAdquirenteEmpresa}).length === 0)
                associar.push(vigente.loginAdquirenteEmpresa.cdLoginAdquirenteEmpresa); 
        }
        
        // Desassociar ?
        for(var k = 0; k < $scope.modalAdquirenteEmpresa.naoSelecionadas.length; k++){ 
            var adquirenteempresa = $scope.modalAdquirenteEmpresa.naoSelecionadas[k];
            if($filter('filter')($scope.modalAdquirenteEmpresa.adquirentesempresa, function(a){return a.cdLoginAdquirenteEmpresa === adquirenteempresa.cdLoginAdquirenteEmpresa}).length === 0)
                desassociar.push(adquirenteempresa.cdLoginAdquirenteEmpresa); 
        }
        
        // Teve alterações ?
        if(associar.length === 0 && desassociar.length ===0){
            // não houve alterações
            fechaModalAdquirenteEmpresa();
            return;
        }
        // JSON
        var json = { idContaCorrente : idContaCorrente };
        if(associar.length > 0) json.associar = associar;
        if(desassociar.length > 0) json.desassociar = desassociar;
        // Envia
        //console.log(json);
        $scope.showProgress();
        $webapi.update($apis.getUrl($apis.card.tbcontacorrentetbloginadquirenteempresa, undefined,
                                 {id : 'token', valor : $scope.token}), json) 
            .then(function(dados){           
                $scope.showAlert('Associações/desassociações realizadas com sucesso!', true, 'success', true);
                // Fecha os progress
                $scope.hideProgress();
                // Fecha o modal
                fechaModalAdquirenteEmpresa();
                // Relista
                buscaContas();
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao realizar associações/desassociações (' + failData.status + ')', true, 'danger', true);
                 // Fecha os progress
                 $scope.hideProgress();
              });  
    }
    
}]);