/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 *
 *  Versão 1.0 - 05/02/2016
 *
 */

// App
angular.module("card-services-antecipacao-bancaria", []) 

.controller("card-services-antecipacao-bancariaCtrl", ['$scope',
                              '$state',
                              '$window',
                              '$webapi',
                              '$apis',
                            function($scope,$state,$window,$webapi,$apis){ 
    $scope.itens_pagina = [50, 100, 150, 200]; 
    $scope.paginaInformada = 1; // página digitada pelo usuário                                             
    // Filtros
    $scope.contas = [];  
    $scope.adquirentes = [];
    $scope.bandeiras = [];  
    $scope.antecipacoes = [];                            
    $scope.filtro = {datamin : new Date(), datamax : '', data : 'Antecipação',
                     conta : null, adquirente : null, bandeira : null,
                     itens_pagina : $scope.itens_pagina[0], order : 0,
                     pagina : 1, total_registros : 0, faixa_registros : '0-0', total_paginas : 0
                    };
                                          
    var divPortletBodyFiltrosPos = 0; // posição da div que vai receber o loading progress
    var divPortletBodyRelatorioPos = 1; // posição da div que vai receber o loading progress                            
    // Modal Novo
    $scope.modalNovo = { adquirente : null,
                         antecipacoes : [],
                         bandeiras : [],
                         conta : null,
                         dtAntecipacaoBancaria : ''
                       }                            
                                
    // Flags
    $scope.exibeTela = false; 
    $scope.abrirCalendarioDataMin = false;
    $scope.abrirCalendarioDataMax = false;                              
    var permissaoAlteracao = false;
    var permissaoCadastro = false;
    var permissaoRemocao = false;
                                
                                
    // Inicialização do controller
    $scope.cardServices_antecipacaoBancariaInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Card Services';                          
        $scope.pagina.subtitulo = 'Antecipação Bancária';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando houver alteração do grupo empresa na barra administrativa 
        $scope.$on('alterouGrupoEmpresa', function(event){
            if($scope.exibeTela){
                // Avalia grupo empresa
                if($scope.usuariologado.grupoempresa){ 
                    // Reseta seleção de filtro específico de empresa
                    $scope.filtro.conta = $scope.filtro.adquirente = $scope.filtro.bandeira = null;
                    buscaContas();
                }else{ // reseta tudo e não faz buscas 
                    $scope.contas = []; 
                    $scope.adquirentes = [];
                    $scope.bandeiras = [];
                    $scope.antecipacoes = [];
                }
            }
        }); 
        // Obtém as permissões
        if($scope.methodsDoControllerCorrente){// && $scope.methodsDoControllerCorrente.length > 0){
            permissaoAlteracao = $scope.methodsDoControllerCorrente['atualização'] ? true : false;   
            permissaoCadastro = $scope.methodsDoControllerCorrente['cadastro'] ? true : false;
            permissaoRemocao = $scope.methodsDoControllerCorrente['remoção'] ? true : false;
        }
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la  
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Carrega dados
            if($scope.usuariologado.grupoempresa) buscaContas();
        });
        // Acessou a tela
        //$scope.$emit("acessouTela");
        $scope.exibeTela = true;
        buscaContas();
    }
    
    
    
    // PERMISSÕES                                           
    /**
      * Retorna true se o usuário pode cadastrar antecipações
      */
    $scope.usuarioPodeCadastrarAntecipacoes = function(){
        return permissaoCadastro;   
    }
    /**
      * Retorna true se o usuário pode alterar antecipações
      */
    $scope.usuarioPodeAlterarAntecipacoes = function(){
        return permissaoAlteracao;
    }
    /**
      * Retorna true se o usuário pode excluir antecipações
      */
    $scope.usuarioPodeExcluirAntecipacoes = function(){
        return permissaoRemocao;
    } 
    
    
    
    
    /* FILTRO */
    
    /**
      * Limpa os filtros
      */
    $scope.limpaFiltros = function(){
        
        // Limpar data => Refazer busca?
        $scope.filtro.datamin = new Date();
        $scope.filtro.datamax = ''; 
        
        $scope.filtro.adquirente = $scope.filtro.bandeira = null; 

        // Limpa relatórios
        $scope.antecipacoes = [];
    }
    
    // DATA RECEBIMENTO
    var ajustaIntervaloDeData = function(){
      // Verifica se é necessário reajustar a data max para ser no mínimo igual a data min
      if($scope.filtro.datamax && $scope.filtro.datamax < $scope.filtro.datamin) $scope.filtro.datamax = $scope.filtro.datamin;
      if(!$scope.$$phase) $scope.$apply();
    };
    // Data MIN
    $scope.exibeCalendarioDataMin = function($event) {
        if($event){
            $event.preventDefault();
            $event.stopPropagation();
        }
        $scope.abrirCalendarioDataMin = !$scope.abrirCalendarioDataMin;
        $scope.abrirCalendarioDataMax = false;
      };
    $scope.alterouDataMin = function(){
         ajustaIntervaloDeData(); 
    };
    // Data MAX
    $scope.exibeCalendarioDataMax = function($event) {
        if($event){
            $event.preventDefault();
            $event.stopPropagation();
        }
        $scope.abrirCalendarioDataMax = !$scope.abrirCalendarioDataMax;
        $scope.abrirCalendarioDataMin = false;
    };
    $scope.alterouDataMax = function(){
        if($scope.filtro.datamax === null) $scope.filtro.datamax = '';
        else ajustaIntervaloDeData(); 
    };                              
                                
                                
   var obtemFiltrosDeBusca = function(){
       var filtros = [];
       // Data
       var filtroData;
        
       if($scope.filtro.data === 'Vencimento') filtroData = {//id: $campos.card.tbantecipacaobancaria.dtVencimento,
                          id: 102,
                          valor: $scope.getFiltroData($scope.filtro.datamin)};  
       else filtroData = {//id: $campos.card.tbantecipacaobancaria.dtAntecipacaoBancaria,
                          id: 101,
                          valor: $scope.getFiltroData($scope.filtro.datamin)};
           
       if($scope.filtro.datamax)
           filtroData.valor = filtroData.valor + '|' + $scope.getFiltroData($scope.filtro.datamax);
       filtros.push(filtroData);
        
       // Conta
       if($scope.filtro.conta && $scope.filtro.conta !== null){
           filtros.push({id: 107,//$campos.card.tbantecipacaobancaria.cdContaCorrente, 
                         valor: $scope.filtro.conta.cdContaCorrente});  
       }
        
       // Adquirente
       if($scope.filtro.adquirente && $scope.filtro.adquirente !== null){
           filtros.push({id: 105,//$campos.card.tbantecipacaobancaria.cdAdquirente, 
                         valor: $scope.filtro.adquirente.cdAdquirente});
       } 
        
       // Bandeira
       if($scope.filtro.bandeira && $scope.filtro.bandeira !== null){
           filtros.push({id: 106,///$campos.card.tbantecipacaobancaria.cdBandeira,
                         valor: $scope.filtro.bandeira.cdBandeira});
       }
        
       // Retorna    
       return filtros;
   }                             
                                
                                
                                
                                
    // PAGINAÇÃO
    /**
      * Altera efetivamente a página exibida
      */                                            
    var setPagina = function(pagina){
       if(pagina >= 1 && pagina <= $scope.filtro.total_paginas){ 
           $scope.filtro.pagina = pagina;
           buscaAntecipacoes();
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
        buscaAntecipacoes();
    };                             
                                
                                
                                
                                
                                
    // CONTAS
    /**
      * Busca as contas correntes
      */
    var buscaContas = function(){
        
         // Avalia se há um grupo empresa selecionado
        if(!$scope.usuariologado.grupoempresa){
            return;   
        }
        
        $scope.showProgress(divPortletBodyFiltrosPos, 10000);
        
        // Filtro  
        var filtros = [{id: /*$campos.card.tbcontacorrente.cdGrupo*/ 101,
                        valor: $scope.usuariologado.grupoempresa.id_grupo},
                       {id: /*$campos.card.tbcontacorrente.flAtivo*/ 106,
                        valor: true}];
           
        $webapi.get($apis.getUrl($apis.card.tbcontacorrente, 
                                [$scope.token, 2, 
                                 /*$campos.card.tbcontacorrente.cdBanco*/ 103, 0],
                                filtros)) 
            .then(function(dados){           

                // Obtém as contas correntes
                $scope.contas = dados.Registros;
            
                if($scope.filtro.conta && $scope.filtro.conta !== null)
                    $scope.filtro.conta = $filter('filter')($scope.contas, function(c) {return c.cdContaCorrente === $scope.filtro.conta.cdContaCorrente;})[0];
                else
                    $scope.filtro.conta = $scope.contas[0];
                // Busca adquirentes
                buscaAdquirentes(true);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter contas correntes (' + failData.status + ')', true, 'danger', true);
                 // Fecha o progress
                 $scope.hideProgress(divPortletBodyFiltrosPos);
              });       
    };
    /**
      * Selecionou uma conta
      */
    $scope.alterouConta = function(progressemexecucao){
        if($scope.filtro.conta && $scope.filtro.conta !== null)
            buscaAdquirentes();
        else{
            $scope.adquirentes = [];
            $scope.bandeiras = [];
        }    
    };    
                                
                                
                                
                                
    // ADQUIRENTES 
    /**
      * Busca as adquirentes associadas à conta
      */
    var buscaAdquirentes = function(progressEstaAberto, cdAdquirente){ 
        
       if(!$scope.filtro.conta || $scope.filtro.conta === null){ 
           if(progressEstaAberto) $scope.hideProgress(divPortletBodyFiltrosPos);
           return;
       }
            
        
       if(!progressEstaAberto) $scope.showProgress(divPortletBodyFiltrosPos, 10000);    
        
       var filtros = [{id: /*$campos.card.tbcontacorrentetbloginadquirenteempresa.cdContaCorrente*/ 100, 
                       valor: $scope.filtro.conta.cdContaCorrente}];
       
       
       $webapi.get($apis.getUrl($apis.card.tbcontacorrentetbloginadquirenteempresa, 
                                [$scope.token, 4],
                                filtros))
            .then(function(dados){
                $scope.adquirentes = dados.Registros;
                // Reseta
                if(typeof cdAdquirente === 'number' && cdAdquirente > 0) 
                    $scope.filtro.adquirente = $filter('filter')($scope.adquirentes, function(a) {return a.cdAdquirente === cdAdquirente;})[0];
                else $scope.filtro.adquirente = null;
                // Busca bandeiras
                $scope.filtro.bandeira = null;
                if($scope.filtro.adquirente && $scope.filtro.adquirente !== null) 
                    buscaBandeiras(true, cdBandeira);
                else $scope.hideProgress(divPortletBodyFiltrosPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter adquirentes da conta (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyFiltrosPos);
              });        
    }   
    /**
      * Selecionou uma adquirente
      */
    $scope.alterouAdquirente = function(){
        buscaBandeiras();
    };
                                
    $scope.alterouAdquirenteModalNovo = function(){
        buscaBandeiras(false, undefined, true);
    }                            
                                
                                
                                
                                
                                
    // BANDEIRAS  
    /**
      * Busca as bandeiras
      */                                             
    var buscaBandeiras = function(progressEstaAberto, cdBandeira, modalNovo){
       
        if(modalNovo){
           if(!$scope.modalNovo.adquirente || $scope.modalNovo.adquirente === null){
               $scope.modalNovo.bandeiras = [];
               if(progressEstaAberto) $scope.hideProgress();
               return;      
           }
        }else if(!$scope.filtro.adquirente || $scope.filtro.adquirente === null){
           $scope.filtro.bandeira = null;
           $scope.bandeiras = [];
           if(progressEstaAberto) $scope.hideProgress(divPortletBodyFiltrosPos);
           return;
       }    
        
       if(!progressEstaAberto){ 
           if(modalNovo)
               $scope.showProgress();
           else 
               $scope.showProgress(divPortletBodyFiltrosPos, 10000);
       }
        
       var filtros = {id: /*$campos.card.tbbandeira.cdAdquirente */ 102, 
                      valor: modalNovo ? $scope.modalNovo.adquirente.cdAdquirente : $scope.filtro.adquirente.cdAdquirente};
       
       $webapi.get($apis.getUrl($apis.card.tbbandeira, 
                                [$scope.token, 1, /*$campos.card.tbbandeira.dsBandeira*/ 101],
                                filtros)) 
            .then(function(dados){
                if(modalNovo){ 
                    $scope.modalNovo.bandeiras = dados.Registros;
                    $scope.hideProgress();
                }else{ 
                    $scope.bandeiras = dados.Registros;
                    // Reseta ou seta para um objeto
                    if(typeof cdBandeira === 'number' && cdBandeira > 0){ 
                        $scope.filtro.bandeira = $filter('filter')($scope.bandeiras, function(b) {return b.cdBandeira === cdBandeira;})[0];
                        if(!$scope.filtro.bandeira) $scope.filtro.bandeira = null;
                    }else $scope.filtro.bandeira = null;
                    // Esconde o progress
                    $scope.hideProgress(divPortletBodyFiltrosPos);
                }
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter bandeiras (' + failData.status + ')', true, 'danger', true);
                  
                 if(modalNovo) $scope.hideProgress();
                 else $scope.hideProgress(divPortletBodyFiltrosPos);
              });     
    };
    /**
      * Selecionou uma bandeira
      */
    $scope.alterouBandeira = function(){
        //console.log($scope.filtro.bandeira);    
    };  
                                
                                
                                
                                
                                
                                
    // ANTECIPAÇÕES
    $scope.buscaAntecipacoes = function(){
        // Avalia se há um grupo empresa selecionado
        if(!$scope.usuariologado.grupoempresa){
            $scope.showModalAlerta('Por favor, selecione uma empresa', 'Atos Capital', 'OK', 
                                   function(){
                                         $timeout(function(){$scope.setVisibilidadeBoxGrupoEmpresa(true);}, 300);
                                    }
                                  );
            return;   
        }
        // Intervalo de data
        if($scope.filtro.datamax){
            var timeDiff = Math.abs($scope.filtro.datamax.getTime() - $scope.filtro.datamin.getTime());
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
            if(diffDays > 31){
                var periodo = diffDays <= 366 ? diffDays + ' dias' : 'mais de um ano';
                $scope.showModalAlerta('Por favor, selecione um intervalo de data de no máximo 31 dias. (Sua seleção consta ' + periodo + ')', 'Atos Capital', 'OK', 
                                   function(){
                                         $timeout(function(){$scope.exibeCalendarioDataMax();}, 300);
                                    }
                                  );
                return; 
            }
        }
        
        if(!$scope.filtro.conta || $scope.filtro.conta === null){
            $scope.showModalAlerta('Uma conta deve ser selecionada!');
            return;
        }
        
        // Busca as antecipações
        buscaAntecipacoes();
    }    
    
    
    var buscaAntecipacoes = function(){
        
       if(!$scope.filtro.conta || $scope.filtro.conta === null)
           return;
        
       $scope.showProgress(divPortletBodyFiltrosPos, 10000);  
       $scope.showProgress(divPortletBodyRelatorioPos);
        
       var filtros = obtemFiltrosDeBusca();
        
       var order = $scope.filtro.data === 'Vencimento' ? /*$campos.card.tbantecipacaobancaria.dtVencimento*/ 102 :
                   101;//$campos.card.tbantecipacaobancaria.dtAntecipacaoBancaria; 
       
       $webapi.get($apis.getUrl($apis.card.tbantecipacaobancaria, 
                                [$scope.token, 2, order, 0, 
                                 $scope.filtro.itens_pagina, $scope.filtro.analitico.pagina],
                                filtros)) 
            .then(function(dados){
                $scope.antecipacoes = dados.Registros;
           
                // Set valores de exibição
                $scope.filtro.total_registros = dados.TotalDeRegistros;
                $scope.filtro.total_paginas = Math.ceil($scope.filtro.total_registros / $scope.filtro.itens_pagina);
                if($scope.antecipacoes.length === 0) $scope.filtro.faixa_registros = '0-0';
                else{
                    var registroInicial = ($scope.filtro.pagina - 1)*$scope.filtro.itens_pagina + 1;
                    var registroFinal = registroInicial - 1 + $scope.filtro.itens_pagina;
                    if(registroFinal > $scope.filtro.total_registros) registroFinal = $scope.filtro.total_registros;
                    $scope.filtro.faixa_registros =  registroInicial + '-' + registroFinal;
                }

                // Verifica se a página atual é maior que o total de páginas
                if($scope.filtro.pagina > $scope.filtro.total_paginas)
                    setPagina(1); // volta para a primeira página e refaz a busca
           
                // Esconde o progress
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyRelatorioPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter antecipações bancárias (' + failData.status + ')', true, 'danger', true);
                 // Esconde o progress
                $scope.hideProgress(divPortletBodyFiltrosPos);
                $scope.hideProgress(divPortletBodyRelatorioPos);
              });   
    }
    
    
    
    
    // MODAL NOVO
    var fechaModalNovo = function(){
        $('#modalNovo').modal('hide');    
    }
    var exibeModalNovo = function(){
        $('#modalNovo').modal('show');    
    }
    
    $scope.novaAntecipacao = function(){
        $scope.modalNovo.conta = $scope.filtro.conta;
        $scope.modalNovo.adquirente = $scope.filtro.adquirente && $scope.filtro.adquirente !== null ?           
                                        $scope.filtro.adquirente : $scope.adquirentes[0];
        $scope.modalNovo.bandeiras = $scope.bandeiras;
        $scope.modalNovo.antecipacoes = [];
        $scope.modalNovo.dtAntecipacaoBancaria = '';
        
        
        
        exibeModalNovo();
    }
    
    $scope.novaAntecipacaoModalNovo = function(){
        $scope.modalNovo.antecipacoes.push({ dtVencimento : '',
                                             cdBandeira : null,
                                             vlAntecipacao : '',
                                             vlAntecipacaoLiquida : '',
                                           });
    }
    $scope.removeAntecipacaoModalNovo = function(index){
        if(index > -1 && index < $scope.modalNovo.antecipacoes.length)
            $scope.modalNovo.antecipacoes.splice(index, 1);
    }
    
                                
    $scope.cadastraAntecipacao = function(){
        
    }   
    
    var cadastraAntecipacao = function(){
        // $scope.validaData($scope.modalNovo.dtAntecipacaoBancaria);
    }
    
    
    $scope.editaAntecipacao = function(antecipacao){
        // ....
    }
    
    
    $scope.excluiAntecipacao = function(antecipacao){
        // ....
    }
    
    
}]);