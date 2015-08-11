/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("administrativo-contas-correntes-vigencias", []) 

/*.filter('orderAdquirentesEmpresas', function() {
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
})*/

.controller("administrativo-contas-correntes-vigenciasCtrl", 
                                            ['$scope',
                                             '$state',
                                             '$stateParams',
                                             '$filter',
                                             '$timeout',
                                             '$http',
                                             /*'$campos',*/
                                             '$webapi',
                                             '$apis',
                                             function($scope,$state,$stateParams,$filter,$timeout,$http,
                                                      /*$campos,*/$webapi,$apis){ 
    
    // Exibição
    $scope.itens_pagina = [10, 20, 50, 100]; 
    $scope.paginaInformada = 1; // página digitada pelo usuário                                             
    // Dados
    $scope.vigencias = [];     
    $scope.conta = null; 
    $scope.adquirentesempresas = []; // originalmente as adquirente-filiais não associadas à conta
    $scope.filtro = {itens_pagina : $scope.itens_pagina[0], order : 0,
                     pagina : 1, total_registros : 0, faixa_registros : '0-0', total_paginas : 0
                    };
    // Modal
    var old = null;                                             
    $scope.modalVigencia = { titulo : '', textoConfirma : '',
                            funcaoConfirma : function(){},
                            adquirenteempresa : undefined,
                            dtInicio : '', dtFim : '' }; 
    var divPortletBodyVigenciasPos = 0; // posição da div que vai receber o loading progress
                                                   
    // Permissões                                           
    var permissaoAlteracao = false;                                           
                                                 
                                                 
                                                 
    
    // Inicialização do controller
    $scope.administrativo_contasCorrentes_vigenciasInit = function(){

        // Título da página 
        $scope.pagina.titulo = 'Administrativo';                          
        $scope.pagina.subtitulo = 'Vigências da Conta Corrente';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando houver alteração do grupo empresa na barra administrativa                                           
        $scope.$on('alterouGrupoEmpresa', function(event){ 
            // volta para a tela de contas correntes
            $scope.goAdministrativoContasCorrentes();
        });
        
        // Tem que ter uma empresa e a conta selecionadas, além do array de adquirentes-filiais
        if(!$scope.usuariologado.grupoempresa || 
           $stateParams.conta === null ||
           $stateParams.adquirentesempresas === null){ 
            $scope.goAdministrativoContasCorrentes();
            return;
        }
        
        // Obtém as permissões
        if($scope.methodsDoControllerCorrente){
            permissaoAlteracao = $scope.methodsDoControllerCorrente['atualização'] ? true : false;  
        }
        // Obtém os dados
        $scope.conta = $stateParams.conta;
        $scope.adquirentesempresas = $stateParams.adquirentesempresas;
        
        // Busca as vigências
        buscaVigencias();
    };
                                                 
                                                 
    // PERMISSÕES                                          
    /**
      * Retorna true se o usuário pode alterar contas correntes
      */
    $scope.usuarioPodeAlterarContas = function(){
        return $scope.usuariologado.grupoempresa && permissaoAlteracao;
    }                                             
                                                 
    
    
                                                                                            
                                                 
    // PAGINAÇÃO
    /**
      * Altera efetivamente a página exibida
      */                                            
    var setPagina = function(pagina){
       if(pagina >= 1 && pagina <= $scope.filtro.total_paginas){ 
           $scope.filtro.pagina = pagina;
           buscaVigencias();
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
        buscaVigencias();
    }; 
                                                 
            
    
    // BUSCA VIGÊNCIAS                                                                      
    /**
      * Busca vigências da conta corrente
      */
    var buscaVigencias = function(){
        
        $scope.showProgress(divPortletBodyVigenciasPos);
        
        // Filtro  
        var filtros = {id: /*$campos.card.tbcontacorrentetbloginadquirenteempresa.cdContaCorrente*/ 100,
                      valor: $scope.conta.idContaCorrente};
           
        $webapi.get($apis.getUrl($apis.card.tbcontacorrentetbloginadquirenteempresa, 
                                [$scope.token, 2, 
                                 /*$campos.card.tbcontacorrentetbloginadquirenteempresa.empresa + $campos.cliente.empresa.ds_fantasia - 100*/ 204, 0, 
                                 $scope.filtro.itens_pagina, $scope.filtro.pagina],
                                filtros)) 
            .then(function(dados){           

                // Obtém os dados
                $scope.vigencias = dados.Registros;
                
                // Set valores de exibição
                $scope.filtro.total_registros = dados.TotalDeRegistros;
                $scope.filtro.total_paginas = Math.ceil($scope.filtro.total_registros / $scope.filtro.itens_pagina);
                if($scope.vigencias.length === 0) $scope.filtro.faixa_registros = '0-0';
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
                $scope.hideProgress(divPortletBodyVigenciasPos);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter vigências (' + failData.status + ')', true, 'danger', true);
                 // Fecha o progress
                 $scope.hideProgress(divPortletBodyVigenciasPos);
              });       
    };
        
                                                 
                                                                
     
    // MODAL VIGENCIA
                                                 
    $scope.ehCadastro = function(){
        return old === null;    
    }
     
    /**
      * Retorna o nome da filial seguido da adquirente
      */    
    $scope.getAdquirenteEmpresaAmigavel = function(adquirenteempresa){
        if(!adquirenteempresa) return '';
        var txt = $scope.getNomeAmigavelFilial(adquirenteempresa.empresa) + 
                  String.fromCharCode(160) + String.fromCharCode(160) + String.fromCharCode(160) +
                  String.fromCharCode(160) + String.fromCharCode(160) + String.fromCharCode(160) +
                  adquirenteempresa.adquirente.dsAdquirente;
        return txt.toUpperCase();
    }
    
    // DATA
    var ajustaIntervaloDeData = function(){
      // Verifica se é necessário reajustar a data max para ser no mínimo igual a data min
      if($scope.modalVigencia.dtFim && $scope.modalVigencia.dtFim < $scope.modalVigencia.dtInicio) $scope.modalVigencia.dtFim = $scope.modalVigencia.dtInicio;
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
       if($scope.modalVigencia.dtFim === null) $scope.modalVigencia.dtFim = '';
       else ajustaIntervaloDeData();
    };                                             
             
                                                 
                                                 
                                                 
    var exibeModalVigencia= function(){
        $('#modalVigencia').modal('show');       
    }
    var fechaModalVigencia = function(){
        $('#modalVigencia').modal('hide');       
    }
                                                 
                                                 
    /**
      * Exibe o input para cadastro de nova vigencia
      */
    $scope.novaVigencia = function(){
        $scope.modalVigencia.titulo = 'Nova vigência';
        $scope.modalVigencia.textoConfirma = 'Cadastrar';
        $scope.modalVigencia.funcaoConfirma = salvarVigencia;
        $scope.modalVigencia.adquirenteempresa = $scope.adquirentesempresas[0];
        $scope.modalVigencia.dtInicio = new Date(); // data atual
        $scope.modalVigencia.dtFim = '';
        
        old = null;
        
        // Exibe o modal
        exibeModalVigencia();
    };
         
            
    /**
      * Valida as informações preenchidas no modal
      */                                             
    var camposModalValidos = function(){
        // Valida
        
        return true;
    }
                                                 
                                                 
    /**
      * Valida as informações preenchidas e envia para o servidor
      */
    var salvarVigencia = function(){

        // Valida campos
        if(!$scope.modalVigencia.adquirenteempresa){
            $scope.showModalAlerta('Informe a filial-adquirente!');
            return;
        }
        
        // Obtém o JSON
        var dtInicio = $scope.getDataFromString($scope.getDataString($scope.modalVigencia.dtInicio));
        var dtFim = $scope.modalVigencia.dtFim ? $scope.getDataFromString($scope.getDataString($scope.modalVigencia.dtFim)) :
                                                 null;
        var jsonVigencia = { cdContaCorrente : $scope.conta.idContaCorrente,
                             cdLoginAdquirenteEmpresa : $scope.modalVigencia.adquirenteempresa.cdLoginAdquirenteEmpresa,
                             dtInicio : dtInicio,
                             dtFim : dtFim
                           }; 
        
        // POST
        //console.log(jsonVigencia);
        $scope.showProgress();
        $webapi.post($apis.getUrl($apis.card.tbcontacorrentetbloginadquirenteempresa, undefined,
                                 {id : 'token', valor : $scope.token}), jsonVigencia) 
            .then(function(dados){           
                $scope.showAlert('Vigência cadastrada com sucesso!', true, 'success', true);
                // Fecha os progress
                $scope.hideProgress();
                // Fecha o modal
                fechaModalVigencia();
                // Relista
                buscaVigencias();
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 500) $scope.showModalAlerta("A vigência não pode ser cadastrada porque há um conflito com o período de outra vigência cadastrada para " + $scope.getAdquirenteEmpresaAmigavel($scope.modalVigencia.adquirenteempresa)); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao cadastrar vigência (' + failData.status + ')', true, 'danger', true);
                 // Fecha os progress
                 $scope.hideProgress();
              });   
    }
                                             
    
    /**
      * Altera os dados da conta
      */
    $scope.alterarDataFim = function(vigencia){
        
        old = vigencia;
        
        $scope.modalVigencia.titulo = 'Alterar vigência';
        $scope.modalVigencia.textoConfirma = 'Alterar';
        $scope.modalVigencia.funcaoConfirma = alterarVigencia;
        $scope.modalVigencia.adquirenteempresa = $filter('filter')($scope.adquirentesempresas, function(v) {return v.cdLoginAdquirenteEmpresa === vigencia.cdLoginAdquirenteEmpresa;})[0];
        
        $scope.modalVigencia.dtInicio = new Date($scope.getDataFromString($scope.getDataString(vigencia.dtInicio)));
        $scope.modalVigencia.dtFim = vigencia.dtFim === null ? '' : 
                                     new Date($scope.getDataFromString($scope.getDataString(vigencia.dtFim)));
        
        // Exibe o modal
        exibeModalVigencia();      
    };
    /**
      * Valida as informações alteradas e envia para o servidor
      */                                             
    var alterarVigencia = function(){

        // Valida campos
        if(typeof old === 'undefined' || old === null) return;
        
        // Houve alterações?
        if($scope.modalVigencia.dtFim === old.dtFim){
            // Não houve alterações
            fechaModalVigencia();
            return;
        }
        
        // Obtém o JSON
        var dtInicio = $scope.getDataFromDate(old.dtInicio);
        var dtFim = $scope.modalVigencia.dtFim ? $scope.getDataFromString($scope.getDataString($scope.modalVigencia.dtFim)) :
                                                 null;
        var jsonVigencia = { cdContaCorrente : $scope.conta.idContaCorrente,
                             cdLoginAdquirenteEmpresa : old.cdLoginAdquirenteEmpresa,
                             dtInicio : dtInicio,
                             dtFim : dtFim
                           }; 
        
        
        // UPDATE
        //console.log(jsonVigencia);
        $scope.showProgress();
        $webapi.update($apis.getUrl($apis.card.tbcontacorrentetbloginadquirenteempresa, undefined,
                                 {id : 'token', valor : $scope.token}), jsonVigencia) 
            .then(function(dados){           
                $scope.showAlert('Vigência alterada com sucesso!', true, 'success', true);
                // Fecha os progress
                $scope.hideProgress();
                // Fecha o modal
                fechaModalVigencia();
                // Relista
                buscaVigencias();
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao alterar a vigência (' + failData.status + ')', true, 'danger', true);
                 // Fecha os progress
                 $scope.hideProgress();
              });   
    }
    
   /**
     * Solicita confirmação para excluir a vigência
     */
    $scope.excluirVigencia = function(vigencia){
        $scope.showModalConfirmacao('Confirmação', 
                                    'Tem certeza que deseja excluir a vigência?',
                                     excluiVigencia, 
                                    { cdContaCorrente : $scope.conta.idContaCorrente,
                                      cdLoginAdquirenteEmpresa : vigencia.cdLoginAdquirenteEmpresa,
                                      dtInicio : $scope.getDataFromDate(vigencia.dtInicio)}, 
                                    'Sim', 'Não');  
    };                   
    /**
      * Efetiva a exclusão da vigência
      */
    var excluiVigencia = function(json){
         
         // Exclui
         $webapi.delete($apis.getUrl($apis.card.tbcontacorrentetbloginadquirenteempresa, undefined,
                                     [{id: 'token', valor: $scope.token},
                                      {id: 'cdContaCorrente', valor: json.cdContaCorrente},
                                      {id: 'cdLoginAdquirenteEmpresa', valor: json.cdLoginAdquirenteEmpresa},
                                      {id: 'dtInicio', valor: json.dtInicio}]))
                .then(function(dados){           
                    $scope.showAlert('Vigência excluída com sucesso!', true, 'success', true);
                    // Fecha os progress
                    $scope.hideProgress();
                    // Relista
                    buscaVigencias();
                  },
                  function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                     else if(failData.status === 500) $scope.showAlert('Conta não pode ser excluída!', true, 'warning', true); 
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                     else $scope.showAlert('Houve uma falha ao excluir a vigência (' + failData.status + ')', true, 'danger', true);
                     // Fecha os progress
                     $scope.hideProgress();
                  });         
    }
                                                 
    
    
    
}]);